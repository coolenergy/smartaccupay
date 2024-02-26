import { CoreModule } from '../core.module';

export function throwIfAlreadyLoaded(
  parentModule: CoreModule,
  moduleName: string
) {
  if (parentModule) {
    throw new Error(
      `${moduleName} has already been loaded. Import ${moduleName} modules in the AppModule only.`
    );
  }
}
